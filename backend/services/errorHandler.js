// Error handler utility - wraps async functions to automatically catch and handle errors
const errorHandle = (fn) => {
    return (req, res) => {
        fn(req, res) // Execute the original function
            .catch((err) => { // Catch any errors that occur
                return res.status(500).json({ error: "Internal server error", errorMessage: err.message })
            })
    }
}

export default errorHandle
