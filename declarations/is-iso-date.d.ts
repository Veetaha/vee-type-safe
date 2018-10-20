declare module 'is-iso-date' {
    function isISODate(suspect: string): boolean;
    export = isISODate;
    // beware to use only "import isISODate = require('is-iso-date');" in order to import.
    // CommonJs style import explanation: https://github.com/Microsoft/TypeScript/issues/7554#issuecomment-197595678
}