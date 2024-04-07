// @ts-nocheck

'use strict';

// ./admin/controllers/accounts.js
// Manages /admin/setup/accounts route

/** Express router providing account related routes
 * @module routers/accounts
 * @requires multer
 * @requires express.Router()
 * @requires ../../services/xlsx
 * @requires ../../services/type-defs
 */

/**
 * Routes to mange data in the accounts table.
 * @type {object}
 * @const
 * @namespace accountsRouter
 */

const multer = require('multer');
const router = require('express').Router();
const { getExcelRows, writeExcelRows } = require('../../services/xlsx');
const DTO = require('../../services/type-defs');

module.exports = router;

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * This callback is displayed as part of the request route.
 * @callback callback~expressCallback
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 */

/**
 * Export accounts records or headers only to excel file
 * @name GET/export_xslx
 * @function
 * @memberof module:routers/accounts~accountsRouter
 * @inner
 * @param {string} path - Router path - /admin/accounts/export_xslx/
 * @param {callback} middleware - Middleware.
 * @param {boolean} headersOnly - True if only headers are to be exported
 * @return {Buffer|string} buffer - File buffer containing exported data
 * @example 
 * Usage to print all records
 * ...
 * const url = 'http://localhost:2828/admin/accounts/export_xslx'
 * ...
 * Usage to print headers only
 * ...
 * const url = 'http://localhost:2828/admin/accounts/export_xslx?headersOnly=true'
 * ...
 */
router.get('/export_xslx/', (req, res) => {
    const headersOnly = req.query.headersOnly === 'true';

    // Get an array of column headers from the defined schema
    // @ts-ignore
    const columns = req.db.accounts.originalSchema.columns.map(
        (column) => column.name
    );
    // Get all data in table
    // @ts-ignore
    req.db.accounts
        // eslint-disable-next-line quotes, prettier/prettier
        .find(columns)
        .then((dto) => writeExcelRows(dto, headersOnly))
        .then((buffer) => {
            // Set the appropriate headers for the response
            res.setHeader(
                'Content-Disposition',
                'attachment; filename="accounts.xlsx"'
            );
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );

            // Send the buffer as the response
            res.send(buffer);
        })
        .catch((err) => {
            res.status(500).json({ message: `${err.message}` });
        });
});

/**
 * Select records in the accounts table
 * @name GET/find
 * @function
 * @memberof module:routers/accounts~accountsRouter
 * @inner
 * @param {string} path - Router path - /admin/accounts/find
 * @param {callback} middleware - Express middleware.
 * @return {Array[]} - Array of objects representing all records found
 */
router.get('/find', (req, res) => {
    const dto = req.body;

    // @ts-ignore
    req.db.accounts
        .find(dto)
        .then((data) =>
            data
                ? res.json(data)
                : res.status(200).json({ message: 'No records found' })
        )
        .catch((err) => res.status(500).json({ message: `${err.message}` }));
});

/**
 * Import accounts from excel file
 * @name POST/import_xslx/:sheet
 * @function
 * @memberof module:routers/accounts~accountsRouter
 * @inner
 * @param {string} path - Router path - /admin/accounts/import_xslx/:sheet
 * @param {callback} middleware - Middleware.
 * @return {string} message - Error or 'Data was imported'
 */
router.post('/import_xslx/:sheet', upload.single('file'), (req, res) => {
    // Access the uploaded file data from req.file.buffer
    // @ts-ignore
    const fileBuffer = req.file.buffer;
    const sheetNo = +req.params.sheet;

    getExcelRows(sheetNo, fileBuffer, 'nap-admin')
        .then((dto) =>
            // @ts-ignore
            req.db.accounts
                .insert(dto)
                .then(() => res.json({ message: 'Data was imported' }))
                .catch((err) => res.status(500).send(err.message))
        )
        .catch((err) => res.status(400).json({ message: `${err.message}` }));
});

/**
 * Insert a new account in accounts table
 * @name POST/insert
 * @function
 * @memberof module:routers/accounts~accountsRouter
 * @inner
 * @param {string} path - Router path - /admin/accounts/insert
 * @param {callback} middleware - Middleware.
 * @param {DTO} req.body - Data to be inserted
 * @return {string} message -Error or 'Data was inserted'
 */
router.post('/insert', (req, res) => {
    const dto = req.body;
    const user = req.user;

    if (dto instanceof Array) {
        dto.forEach((row) => {
            // eslint-disable-next-line no-param-reassign
            row.created_by = user;
        });
    } else {
        dto.created_by = user;
    }

    // @ts-ignore
    req.db.accounts
        .insert(dto)
        .then(() => res.json({ message: 'Data was inserted' }))
        .catch((err) => res.status(500).json({ message: `${err.message}` }));
});

/** Updates a account in settins table
 * @name PUT/update
 * @function
 * @memberof module:routers/accounts~accountsRouter
 * @inner
 * @param {string} path - Router path - /admin/accounts/update
 * @param {callback} middleware - Middleware.
 * @param {DTO} req.body - Data to be updated
 * @return {string} message -Error or 'Record was updated'
 * @example
 * ...
 * // DTO to be processed
 * const dto = {
 *      company_id: '010',      // PRIMARY KEY - Required
 *      active: false,           // Column to be updated - At least 1 column is required
 * }
 * ...
 */
router.put('/update', (req, res) => {
    const dto = req.body;
    const user = req.user;

    dto.updated_by = user;

    // @ts-ignore
    req.db.accounts
        .update(dto)
        .then(() => res.json({ message: 'Record was updated' }))
        .catch((err) => res.status(500).json({ message: `${err.message}` }));
});
