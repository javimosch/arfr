import resolver from '../resolver';
export default function() {
    return {
        name: "$resolver",
        def: [function() {
            return resolver;
        }]
    };
}
