module.exports = {
    name: "users",
    def: {
        email: String,
        pwd: String
    },
    configure: (schema) => schema
};
