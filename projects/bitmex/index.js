const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
       '0xEEA81C4416d71CeF071224611359F6F99A4c4294', // Etherscan Label (seems cold)
       '0xfb8131c260749c7835a08ccbdb64728de432858e'  // Etherscan Label (seems hot)
    ],
  },
  bitcoin: {
    owners: ['3BMEXqGpG4FxBA1KWhRFufXfSTRgzfDBhJ']
  }
}

module.exports = cexExports(config)