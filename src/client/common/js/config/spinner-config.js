export default function() {
    return ['usSpinnerConfigProvider', function(usSpinnerConfigProvider) {
        usSpinnerConfigProvider.setDefaults({
            color: 'skyblue',
            speed: 2,
            opacity:0.5,
            scale: 0.5,
            hwaccel: true
        });
    }];
}
