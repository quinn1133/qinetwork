function Logo() {
    return (
        <svg width="40" height="40" viewBox="0 0 40 40">
            <defs>
                <linearGradient
                    id="jsc_s_b"
                    x1="50%"
                    x2="50%"
                    y1="97.078%"
                    y2="0%"
                >
                    <stop offset="0%" stopColor="#0062E0"></stop>
                    <stop offset="100%" stopColor="#19AFFF"></stop>
                </linearGradient>
            </defs>
            <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="url(#jsc_s_b)"
                fontSize="32"
                fontWeight="bold"
                fontFamily="Arial, sans-serif"
            >
                Qi
            </text>
        </svg>
    );
}

export default Logo;
