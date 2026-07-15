const Report = require("../models/reports");

module.exports.dashboard = async (req, res) => {
  const reports = await Report.find({})
    .populate("reportedBy", "username email")
    .populate({
      path: "targetId",
      strictPopulate: false 
    })
    .sort({ createdAt: -1 });
  res.render("ADMIN/dashboard.ejs", { reports });
};

module.exports.deleteReport = async (req, res) => {
  await Report.findByIdAndDelete(req.params.id);
  req.flash("success", "Report dismissed successfully.");
  res.redirect("/admin/dashboard");
};
