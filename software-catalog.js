export default Ember.Object.create({
        "tools": [
            {
                "id": "serdes-generator",
                "name": "SERDES Generator",
                "version": "GitHub Master branch",
                "functionality": {
                    "description": "SERDES generator for Cadence generic library (cds_ff_mpt)",
                    "notes": ""
                },
                "modules": [
                    "serdes"
                ]
            }
        ],
        "modules": [
            {
                "id": "serdes",
                "name": "serdes",
                "conflicts": []
            },
            {
                "id": "python3",
                "name": "python3",
                "conflicts": []
            }
        ]
    }
);
