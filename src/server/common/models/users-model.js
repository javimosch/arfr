module.exports = {
    name: "users",
    def: {
        email: {
            type: String,
            index: true,
            unique: true,
            required: true
        },
        pwd: {
            type: String,
            required: true
        },
        firstName: String,
        lastName: String,
        role: {
            type: String,
            required: true,
            default: 'client'
        }
    },
    configure: (schema) => schema
};
