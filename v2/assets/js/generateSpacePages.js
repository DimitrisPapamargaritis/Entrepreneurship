const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

// Correct paths
const xmlPath = path.join(__dirname, '..', 'spaces', 'spaces.xml');
const templatePath = path.join(__dirname, '..', '..', 'space', '{SPACE_ID}.html');
const outputDir = path.join(__dirname, '..', '..', 'space');

const template = fs.readFileSync(templatePath, 'utf8');
const parser = new xml2js.Parser();

fs.readFile(xmlPath, (err, data) => {
    if (err) throw err;
    parser.parseString(data, (err, result) => {
        if (err) throw err;

        const spaces = result.spaces.space;
        spaces.forEach(space => {
            const id = space.id[0];
            const name = space.name[0];
            const image = space.image[0].replace('./assets/spaces/images/', ''); // Remove path if needed
            const address = space.address[0];
            const addressLink = space.addressLink[0];
            const phone = space.phone[0];
            const hours = space.hours[0];
            const features = space.features[0];
            const mapEmbed = space.mapEmbed[0];

            let html = template
                .replace(/{SPACE_ID}/g, id)
                .replace(/{SPACE_NAME}/g, name)
                .replace(/{SPACE_IMAGE}/g, image)
                .replace(/{SPACE_ADDRESS}/g, address)
                .replace(/{SPACE_ADDRESS_LINK}/g, addressLink)
                .replace(/{SPACE_PHONE}/g, phone)
                .replace(/{SPACE_HOURS}/g, hours)
                .replace(/{SPACE_FEATURES}/g, features)
                .replace(/{SPACE_MAP_EMBED_URL}/g, mapEmbed);

            fs.writeFileSync(
                path.join(outputDir, `${id}.html`),
                html,
                'utf8'
            );
            console.log(`Generated space/${id}.html`);
        });
    });
});