const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { type } = require("os");
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // ১. পিডিএফ ফাইলের জন্য কনফিগারেশন
    if (file.mimetype === "application/pdf") {
      return {
        folder: "QNotes/pdfs", // PDF আপলোডের ফোল্ডার নাম
        resource_type: "raw",
        type: "upload", // Cloudinary-তে PDF আপলোডের জন্য 'raw' দিতে হয়
        public_id: `fileUrl-${Date.now()}${ext}`,
      };
    }

    return {
      folder: "QNotes/images", // ইমেজ আপলোডের ফোল্ডার নাম
      resource_type: "image", // ফাইলের ধরন ইমেজ
      allowedFormats: ["png", "jpg", "jpeg"],
      type: "upload", // শুধু এই ফরম্যাটের ইমেজ এলাউ করবে
      public_id: `imageUrl-${Date.now()}${ext}`,
    };
  },
});

const upload = multer({
  storage: storage,
  // limits: {
  //   fileSize: 15 * 1024 * 1024, // গ্লোবাল ম্যাক্সিমাম লিমিট ১৫ MB রাখা হলো (যেহেতু ইমেজের লিমিট বেশি)
  // },
  // fileFilter: (req, file, cb) => {
  //   // এক্সপ্রেস রিকোয়েস্ট থেকে content-length (বাইট আকারে) রিড করা
  //   const fileSize = parseInt(req.headers['content-length']);

  //   if (file.fieldname === "fileUrl") {
  //     const maxPdfSize = 5 * 1024 * 1024;
  //     if (fileSize > maxPdfSize) {
  //       const error = new multer.MulterError("LIMIT_FILE_SIZE");
  //       error.message = "PDF <= 5MB";
  //       req.flash("error", error.message);
  //       return cb(error, false);
  //     }
  //   }

  //   if (file.fieldname === "imageUrl") {
  //     const maxImgSize = 15 * 1024 * 1024;
  //     if (fileSize > maxImgSize) {
  //       const error = new multer.MulterError("LIMIT_FILE_SIZE");
  //       error.message = "Image <= ১৫";
  //       req.flash("error", error.message);
  //       return cb(error, false);
  //     }
  //   }

  //   cb(null, true);
  // }
});

module.exports = {
  cloudinary,
  storage,
  upload,
};
