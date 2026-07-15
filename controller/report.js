const Report = require("../models/reports");

module.exports.postReport = async (req, res) => {
  const { targetId, reportOn, reason } = req.body;

  const existingReport = await Report.findOne({
    reportedBy: req.user._id,
    targetId: targetId,
  });

  if (existingReport) {
    req.flash("error", "You have already reported this content!");
    return res.redirect("question");
  }

  const newReport = new Report({
    reportedBy: req.user._id,
    targetId: targetId,
    reportOn: reportOn,
    reason: reason,
  });

  
  await newReport.save();
  req.flash("success", "Thank you. Your report has been submitted.");
  res.redirect(req.headers.referer || "/question"); // ইউজার যে পেজে ছিল সেখানেই ব্যাক করবে
};
