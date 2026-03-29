import multer from "multer" ;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './my-uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.fieldname)
  }
})

const upload = multer({ storage: storage, limits: {fileSize: 2 * 1024 * 1024} }); // 5mb
export default upload;