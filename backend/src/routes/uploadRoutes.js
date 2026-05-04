import express from "express";
import multer from "multer";
import ImageKit from "imagekit";

const uploadRoute = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const imagekit = new ImageKit({
  publicKey:   process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey:  process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

uploadRoute.post("/", upload.array("images", 3), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files received" });
    }

    const uploadPromises = req.files.map((file) => {
      // v6 requires base64 string, not raw buffer
      const base64 = file.buffer.toString("base64");
      const dataUri = `data:${file.mimetype};base64,${base64}`;

      return imagekit.upload({
        file:     dataUri,         // ← v6 needs base64 data URI
        fileName: file.originalname,
        folder:   "/products",
        useUniqueFileName: true,
      });
    });

    const results = await Promise.all(uploadPromises);
    const urls = results.map((r) => r.url);

    res.status(200).json({ urls });

  } catch (error) {
    console.error("ImageKit upload error:", error); // ← check terminal for this
    res.status(500).json({ message: error.message ?? "Image upload failed" });
  }
});

export default uploadRoute;