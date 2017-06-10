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
        role: {
            type: String,
            required: true,
            default: 'client'
        }
    },
    configure: (schema) => schema
};
