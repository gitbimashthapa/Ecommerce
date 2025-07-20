const errorHandler=(fn)=>{
    return(req, res)=>{
        fn(req, res)
        .catch((err)=>{
            return res.status(500).json({ error: "Internal server error", errorMessage:err.messsage });
        })
    }

}

export default errorHandler