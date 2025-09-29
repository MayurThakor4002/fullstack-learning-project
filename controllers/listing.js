const Listing = require("../model/listing");

// index Route

module.exports.index = async (req, res) => {
  const allListing = await Listing.find({});
  res.render("listing/index", { listings: allListing });
};

// Route for render form for add new listing

module.exports.renderNewForm = (req, res) => {
  res.render("listing/new");
};
// Route for create Listing

module.exports.createListing = async (req, res) => {
  let url = req.file.path;
  let filename = req.file.path;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  await newListing.save();
  console.log(newListing);
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

// Route for Show Listing

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }
  console.log(listing);
  res.render("listing/show", { listing });
};

// Route for edit listing which are exist..
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  // if (!listing) throw new ExpressError(404, "Listing Not Found");
  res.render("listing/edit", { listing, originalImageUrl });
};

// update listing ( after edit listing updating the listing)
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const data = req.body.listing;
  let listing = await Listing.findByIdAndUpdate(id, { ...data });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.path;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

// delete listing
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

