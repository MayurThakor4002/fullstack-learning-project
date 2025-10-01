const Listing = require("./model/listing");
const ExpressError = require("./utils/ExpressError");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./model/review.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logged in to create listings!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not owner of this listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not author of this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};


module.exports.getCoordinates = async (req, res, next) => {
  try {
    if (!req.body.listing.location || !req.body.listing.country) {
      req.flash("error", "Please enter both country and location.");
      return res.redirect("/listings/new");
    }

    const location = `${req.body.listing.location}, ${req.body.listing.country}`;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`,
      {
        headers: {
          'User-Agent': 'WanderlustApp/1.0 (https://wanderlust-aqhp.onrender.com)',
          'Accept-Language': 'en'
        }
      }
    );


    console.log("Fetch response status:", response.status);
    const data = await response.json();
    console.log("Data from Nominatim:", data);

    if (data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      req.body.listing.geometry = {
        type: "Point",
        coordinates: [lon, lat],
      };
    } else {
      req.flash("error", "Location not found. Please enter a valid location.");
      return res.redirect("/listings/new");
    }

    next();
  } catch (err) {
    console.error("Error fetching coordinates:", err);
    req.flash("error", "Could not fetch coordinates for the location.");
    return res.redirect("/listings/new");
  }
};


