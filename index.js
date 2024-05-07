const express = require('express');
const session = require('express-session');
const geo = require('node-geocoder');
const geocoder = geo({ provider: 'openstreetmap' });

require('dotenv').config();
const Database = require('./db.js');
const db = new Database();

const initialize = async () => {
    await db.connect();

    await db.schema('Contacts', [
        { name: 'contactId', type: 'INTEGER' },
        { name: 'fname', type: 'TEXT' },
        { name: 'lname', type: 'TEXT' },
        { name: 'phone', type: 'TEXT' },
        { name: 'email', type: 'TEXT' },
        { name: 'address', type: 'TEXT' },
        { name: 'title', type: 'TEXT' },
        { name: 'contact_by_phone', type: 'INTEGER' },
        { name: 'contact_by_email', type: 'INTEGER' },
        { name: 'contact_by_mail', type: 'INTEGER' },
        { name: 'latitude', type: 'REAL' },
        { name: 'longitude', type: 'REAl' }
    ], 'contactId');

    const result = await geocoder.geocode("505 ramapo valley rd mahwah");
    var lat, lng, address;
    lat = result[0].latitude;
    lng = result[0].longitude;
    const reversed = await geocoder.reverse({ lat: lat, lon: lng });
    address = reversed[0].formattedAddress;    
    if (!await db.findContactByName("Rocky", "Roadrunner", "(201) 684-7500", "rockyRoadrunner@ramapo.edu", address, "Mr.", 1, 1, 0, lat, lng)) {
        await db.createContact("Rocky", "Roadrunner", "(201) 684-7500", "rockyRoadrunner@ramapo.edu", address, "Mr.", 1, 1, 0, lat, lng);
    }

    /*
    if (!(await db.findContactByName("Kacie", "Kreiger"))) {
        await db.createContact("Kacie", "Kreiger", "583.697.1734 x0810", "Aryanna.OKeefe@gmail.com", "33477 Bergstrom Fields", "Malindafurt", "South Carolina", "42255", "United States", 1, 1, 0);
    }
    if (!(await db.findContactByName("Kiel", "McDermott"))) {
        await db.createContact("Kiel", "McDermott", "1-551-482-7627 x78370", "Jamarcus.OKon@gmail.com", undefined, "Fort Mona", "Minnesota", "86503-2100", "United States", 0, 0, 0);
    }
    if (!(await db.findContactByName("Abner", "Dach"))) {
        await db.createContact("Abner", "Dach", "(395) 827-2182 x234", "Kayli.Gerhold47@gmail.com", undefined, "South Yasmeenton", "Connecticut", "48447-2539", "United States", 0, 0, 0);
    }
    if (!(await db.findContactByName("Maximilian", "Watsica"))) {
        await db.createContact("Maximilian", "Watsica", "1-456-957-6014 x90804", "Josianne_Collins@gmail.com", undefined, "Port St. Lucie", "Wyoming", "82197", "United States", 0, 0, 0);
    }
    if (!(await db.findContactByName("Ciara", "Bosco"))) {
        await db.createContact("Ciara", "Bosco", "393.871.6055 x77746", "Jeanie2@yahoo.com", undefined, "Bayonne", "Massachusetts", "24952-1510", "United States", 1, 0, 0);
    }
    if (!(await db.findContactByName("Liza", "Brekke"))) {
        await db.createContact("Liza", "Brekke", "257.435.2736 x08824", "Silas.Wuckert@hotmail.com", undefined, "Sarahborough", "South Carolina", "37110", "United States", 0, 0, 0);
    }
    if (!(await db.findContactByName("Broderick", "Nienow"))) {
        await db.createContact("Broderick", "Nienow", "(407) 628-4587", "Gino71@yahoo.com", "", "Alvastad", "Alabama", "19314", "United States", 0, 0, 0);
    }*/
    

    await db.schema('Users', [
        { name: 'id', type: 'INTEGER' },
        { name: 'fname', type: 'TEXT' },
        { name: 'lname', type: 'TEXT' },
        { name: 'username', type: 'TEXT' },
        { name: 'password', type: 'TEXT' }
    ], 'id');
}

initialize();
const app = express();
app.locals.pretty = true;
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    req.db = db;
    next();
})

app.use(session({
    secret: 'cmps369',
    resave: false,
    saveUnitialized: true,
    cookie: { secure: false }
}))

app.use((req, res, next) => {
    if (req.session.user) {
        userID = req.session.user.id;
        userUSERNAME = req.session.user.username;
        userFNAME = req.session.user.fname;
        userLNAME = req.session.user.lname;        
        res.locals.user = {
            id: userID,
            username: userUSERNAME,
            fname: userFNAME,
            lname: userLNAME
        }
    }
    next()
})

app.set('view engine', 'pug');

app.use(express.static('public'));

app.get('/contacts', async (req, res) => {
    const contact_list = await req.db.findContactList();
    res.json({ contacts: contact_list });
});

app.use('/', require('./routes/accounts'));
app.use('/', require('./routes/contacts'));

app.listen(8080, () => {
    console.log('Server is running on port 8080')
})