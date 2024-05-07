const assert = require('assert');
const sqlite = require('sqlite-async');
class DataStore {
    constructor() {
        this.path = process.env.DBPATH;
        assert(this.path !== undefined, "DBPATH not specified in environment.");
    }

    async connect() {
        this.db = await sqlite.open(this.path);
    }

    async create(table, data) {
        const params = Array(data.length).fill('?')
        const sql = `INSERT into ${table} (${data.map(d => d.column).join(',')}) values(${params.join(',')})`;
        const result = await this.db.run(
            sql,
            data.map(d => d.value));
        return result.lastID;
    }

    async read(table, query) {
        let sql = `SELECT * from ${table}`;
        if (query.length > 0) {
            sql += ` WHERE ${query.map(d => `${d.column}=?`).join(' and ')}`
        }
        return await this.db.all(
            sql, query.map(d => d.value)
        );
    }

    async update(table, data, query) {
        let sql = `UPDATE ${table} set ${data.map(d => `${d.column}=?`)} where ${query.map(d => `${d.column} = ?`).join(' and ')}`;
        const _data = data.map(d => d.value).concat(query.map(q => q.value));
        return await this.db.run(sql, _data)
    }

    async schema(table, schema, pkey) {
        const sql = `CREATE TABLE IF NOT EXISTS "${table}"
            (${schema.map(c => `"${c.name}" ${c.type}`).join(", ")},
            PRIMARY KEY ("${pkey}"))`;
        await this.db.run(sql);
        return;
    }

    async delete(table, query) {
        assert(query.length > 0, 'Deleting without query is a bad idea');
        let sql = `DELETE from ${table} WHERE ${query.map(d => `${d.column} = ?`).join(' and ')}`;
        return await this.db.all(
            sql, query.map(d => d.value)
        );
    }

    async createUser(fname, lname, username, password) {
        const id = await this.create('Users', [
            { column: 'fname', value: fname },
            { column: 'lname', value: lname },
            { column: 'username', value: username },
            { column: 'password', value: password }
        ])
        return id;
    }

    async createContact(fname, lname, phone, email, address, title, cphone, cemail, cmail, latitude, longitude) {
        const contactId = await this.create('Contacts', [
            { column: 'fname', value: fname },
            { column: 'lname', value: lname },
            { column: 'phone', value: phone },
            { column: 'email', value: email },
            { column: 'address', value: address },
            { column: 'title', value: title },
            { column: 'contact_by_phone', value: cphone },
            { column: 'contact_by_email', value: cemail },
            { column: 'contact_by_mail', value: cmail },
            { column: 'latitude', value: latitude },
            { column: 'longitude', value: longitude }
        ])
        return contactId;
    }

    async findUserByUsername(username) {
        const us = await this.read('Users', [{ column: 'username', value: username }]);
        if (us.length > 0) return us[0];
        else {
            return undefined;
        }
    }

    async findUserById(id) {
        const us = await this.read('Users', [{ column: 'id', value: id }]);
        if (us.length > 0) return us[0];
        else {
            return undefined;
        }
    }

    async findContactById(id) {
        const con = await this.read('Contacts', [{ column: 'contactId', value: id }]);
        if (con.length > 0) return con[0];
        else {
            return undefined;
        }
    }

    async findContactList() {
        const cons=await this.read('Contacts',[])
        if (cons.length > 0) return cons;
        else return undefined;
    }

    async findContactByName(fname, lname) {
        const name = await this.read('Contacts', [{ column: 'fname', value: fname }, { column: 'lname', value: lname }]);
        if (name.length > 0) return name[0];
        else {
            return undefined;
        }
    }

    async deleteContactById(id) {
        const del = await this.delete('Contacts', [{ column: 'contactId', value: id }]);
        return del;
    }

    async editContactById(id, fname, lname, phone, email, address, title, cphone, cemail, cmail, latitude, longitude) {
        const up = await this.update('Contacts', [
            { column: 'fname', value: fname },
            { column: 'lname', value: lname },
            { column: 'phone', value: phone },
            { column: 'email', value: email },
            { column: 'address', value: address },
            { column: 'title', value: title },
            { column: 'contact_by_phone', value: cphone },
            { column: 'contact_by_email', value: cemail },
            { column: 'contact_by_mail', value: cmail },
            { column: 'latitude', value: latitude },
            { column: 'longitude', value: longitude }],
            [{ column: 'contactId', value: id }]);
        return up;
    }
}

module.exports = DataStore;