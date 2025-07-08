const asyncHandler = (fn) => (req, res, next) => {
    console.log("Entering asyncHandler");
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.log(`Error occurred at path ${req.path}:`, error);
      return res.status(500).json({
        message: "Internal server error",
      });
    });
  };
  
  export default asyncHandler;