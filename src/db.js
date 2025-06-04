const { Pool } = require("pg")

const DB = () => {
    return new Pool()
}

module.exports = DB