const DBError = (err)=>{
    console.log("came here");
    const errorCode = err.message.split(' ')[0];
    console.log(errorCode);
    switch (errorCode) {
        case "E11000":
            return err.message = "This user already exists";
            break;
        case "E50":
            return err.message = "Request timed out";
            break;
        default:
            return err.message = "Database Error. Please try again later...";
            break;
    }
}

module.exports = DBError;