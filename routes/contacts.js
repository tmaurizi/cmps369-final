const express = require('express');
const router = express.Router();
const geo = require('node-geocoder');
const geocoder = geo({ provider: 'openstreetmap' });

router.get('/', async (req, res) => {  
    const contact_list = await req.db.findContactList();
    res.render('contacts', { contact_list: contact_list });
});

const logged_in = (req, res, next) => {
    if (req.session.user) {
        next();
    }
    else {
        res.status(401).send("Not authorized");
    }
}

router.get('/create', async (req, res) => {
    res.render('create', {});
});

router.post('/create', async (req, res) => {
    const fname = req.body.fname.trim()
    const lname = req.body.lname.trim();
    const title = req.body.title;
    const phone = req.body.phone.trim();
    const email = req.body.email.trim();
    const street = req.body.street.trim();
    const city = req.body.city.trim();
    const state = req.body.state.trim();
    const zip = req.body.zip.trim();
    const country = req.body.country.trim();
    const cphone = req.body.cphone;
    const cemail = req.body.cemail;
    const cmail = req.body.cmail;

    const tempaddress = street + " " + city + " " + state + " " + zip + " " + country;
    var result;
    if (tempaddress) {
        result = await geocoder.geocode(tempaddress);
    }
    else {
        res.render('create', { message: 'Invalid address' });
    }
    var lat, lng, address;
    if (result.length > 0) {
        lat = result[0].latitude;
        lng = result[0].longitude;
        const reversed = await geocoder.reverse({ lat: lat, lon: lng });
        address = reversed[0].formattedAddress;
    }
    else {
        res.render('create', { message: 'Invalid address' });
        return;
    }

    if (!fname && !lname) {
        res.redirect('/');
        return;
    }
    
    const nameExist = await req.db.findContactByName(fname, lname);
        if (nameExist) {
            res.render('create', { message: 'Person has already been added' });
            return;
        }
    
    contactId = await req.db.createContact(fname, lname, phone, email, address, title, cphone, cemail, cmail, lat, lng);
    res.redirect('/');
});

router.get('/:contactId', async (req, res) => {
    const contact = await req.db.findContactById(req.params.contactId);
    if (contact == null) {
        res.redirect('/');
        return;
    }
    if (contact) {
        res.render('contactinfo', { contact: contact, contactId: contact.contactId });
    }
    else {
        res.redirect('/');
    }
});

router.get('/:contactId/delete', logged_in, async (req, res) => {
    const contact = await req.db.findContactById(req.params.contactId);
    if (contact) {
        res.render('delete', { contact: contact, contactId: contact.contactId });
    }
    else {
        res.redirect('/');
    }
});
router.post('/:contactId/delete', async (req, res) => {
    await req.db.deleteContactById(req.params.contactId);
    res.redirect('/');
});

router.get('/:contactId/edit', logged_in, async (req, res) => {
    const contact = await req.db.findContactById(req.params.contactId);
    const reversed = await geocoder.reverse({ lat: contact.latitude, lon: contact.longitude });
    const street = reversed[0].streetNumber + " " + reversed[0].streetName;
    const city = reversed[0].city;
    const state=reversed[0].state;
    const zip=reversed[0].zipcode;
    const country = reversed[0].country;    
    res.render('edit', { contact: contact, contactId: contact.contactId, street: street, city: city, state: state, zip: zip, country: country });
});
router.post('/:contactId/edit', async (req, res) => {
    var contact = await req.db.findContactById(req.params.contactId);
    const fname = req.body.fname.trim()
    const lname = req.body.lname.trim();
    const title = req.body.title;
    const phone = req.body.phone.trim();
    const email = req.body.email.trim();
    const street = req.body.street.trim();
    const city = req.body.city.trim();
    const state = req.body.state.trim();
    const zip = req.body.zip.trim();
    const country = req.body.country.trim();
    const cphone = req.body.cphone;
    const cemail = req.body.cemail;
    const cmail = req.body.cmail;

    const tempaddress = street + " " + city + " " + state + " " + zip + " " + country;
    var result;
    if (tempaddress) {
        result = await geocoder.geocode(tempaddress);
    }
    else {
        res.render('edit', { contact: contact, contactId: contact.contactId, street: street, city: city, state: state, zip: zip, country: country, message: 'Invalid address' });
    }
    var lat, lng, address;
    if (result.length > 0) {
        lat = result[0].latitude;
        lng = result[0].longitude;
        const reversed = await geocoder.reverse({ lat: lat, lon: lng });
        address = reversed[0].formattedAddress;
    }
    else {
        res.render('edit', { contact: contact, contactId: contact.contactId, street: street, city: city, state: state, zip: zip, country: country, message: 'Invalid address' });
        return;
    }

    contact = await req.db.editContactById(req.params.contactId, fname, lname, phone, email, address, title, cphone, cemail, cmail, lat, lng);
    res.redirect('/:contactId');
});

module.exports = router;