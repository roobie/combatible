BR.data.push({
    type: "Material",
    subtype: "Metal",
    id: "material_iron",
    name: "iron",
    features: [
        "corroding:[oxygen, water]"
    ],
    density: 152
});
BR.data.push({
    type: "Trait",
    id: "greedy",
    name: "greedy"
});
BR.data.push({
    name: "Human",
    type: "Thing:Animate",
    demonym: {
        singular: "human",
        plural: "humans"
    },
    default_representation: {
        glyph: "H",
        color: {
            fg: "#444",
            bg: "#222"
        }
    },
    variants: [
        "male",
        "female",
    ],
    stages: [
        "infant",
        "child",
        "adolescent",
        "adult",
        "elder"
    ],
    subtypes: [ // order matters: general --> specific
        "Organism",
        "Animal",
        "Bipedal",
        "Humanoid"
    ],
    sentient: true,
    body: {
        anatomy: {
            layout: (function() {
                var
                head = {
                    name: "head",
                    // sub_parts: [
                    //     { name: "cranium", type: "bone_human" },
                    //     { name: "nose", type: "cartilage_human" },
                    //     { name: "tounge", type: "muscle_human" },
                    //     { name: "tooth", type: "bone_human", count: 36 },
                    //     { name: "muscle", type: "muscle_human", count: 4 },
                    //     { name: "artery", type: "bloodvessel_human", count: 2 },
                    // ]
                },
                neck = {
                    name: "neck"
                },
                shoulder = {
                    name: "shoulder"
                },
                arm_upper = {
                    name: "upper arm"
                },
                arm_lower = {
                    name: "lower arm"
                },
                hand = {
                    name: "hand"
                },
                thorax = {
                    name: "thorax"
                },
                abdomen_upper = {
                    name: "upper abdomen"
                },
                abdomen_lower = {
                    name: "lower abdomen"
                },
                groin = {
                    name: "groin"
                },
                hip = {
                    name: "hip"
                },
                leg_upper = {
                    name: "thigh"
                },
                knee = {
                    name: "knee"
                },
                leg_lower = {
                    name: "lower leg"
                },
                foot = {
                    name: "foot"
                };

                return [
                    [null, head, null],
                    [shoulder, neck, shoulder],
                    [arm_upper, thorax, arm_upper],
                    [arm_lower, abdomen_upper, arm_lower],
                    [hand, abdomen_lower, hand],
                    [groin, hip, groin],
                    [leg_upper, null, leg_upper],
                    [knee, null, knee],
                    [leg_lower, null, leg_lower],
                    [foot, null, foot],
                ];
            })(),
            // organs: [
            //     { name: "brain", location: "head" },
            //     {
            //         name: "eye",
            //         type: "flesh_human",
            //         sub_parts: [
            //             { name: "cornea", type: "flesh_human" },
            //             { name: "globe", type: "flesh_human" },
            //             { name: "eyelid", type: "flesh_human" }
            //         ]
            //     },
            // ]
        },
        attributes: {
            strength: {
                max: 1000,
                min: 100,
                mean: 400,
                value: 400
            },
            agility: {
                max: 1000,
                min: 100,
                mean: 400,
                value: 400
            }
        }
    },
    soul: {
        traits: [
            "greedy"
        ]
    },
});
