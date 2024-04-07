/* eslint-disable class-methods-use-this */

'use strict';

// ./admin/models/Companies.js
// Companies catalog

const { Model } = require('nap-db');

const companySchema = {
    tableName: 'companies',
    columns: [
        {
            name: 'company_id',
            type: 'varchar',
            length: 3,
        },
        {
            name: 'company',
            type: 'varchar',
            length: 100,
            notNull: true,
        },
        {
            name: 'description',
            type: 'varchar',
            length: 255,
        },
        {
            name: 'tax_id',
            type: 'varchar',
            length: 15,
            notNull: true,
        },
        {
            name: 'active',
            type: 'boolean',
            notNull: true,
            default: true,
        },
        {
            name: 'address_1',
            type: 'varchar',
            length: 255,
            notNull: true,
        },
        {
            name: 'address_2',
            type: 'varchar',
            length: 255,
            default: '',
            useDefault: true,
        },
        {
            name: 'city',
            type: 'varchar',
            length: 255,
            notNull: true,
        },
        {
            name: 'region',
            type: 'varchar',
            length: 255,
            notNull: true,
        },
        {
            name: 'postal_code',
            type: 'varchar',
            length: 255,
            notNull: true,
        },
        {
            name: 'country',
            type: 'varchar',
            length: 255,
        },
    ],
    primaryKeys: [
        {
            name: 'company_id',
        },
    ],
};

/**
 * Companies - Models data in the companies table
 */
class Companies extends Model {
    static #cs;

    /**
     * Companies data model
     * @param {Object} db - {@link https://vitaly-t.github.io/pg-promise/Database.html pg-promise} database connection represented by class {@link DB}
     * @param {Object} pgp - {@link https://vitaly-t.github.io/pg-promise/module-pg-promise.html pg-promise} object
     * @param {Object} schema - Deep copy of companySChema to map columns
     */
    constructor(db, pgp, schema = JSON.parse(JSON.stringify(companySchema))) {
        super(db, pgp, schema);

        if (!Companies.#cs) {
            Companies.#cs = this.createColumnsets();
            super.setColumnsets(Companies.#cs);
        }
    }

    /**
     * Retrieves the ColumnSet object
     * @returns ColumnSet object associated with the data model
     */
    getColumnSet() {
        return Companies.#cs;
    }
}

module.exports = Companies;
