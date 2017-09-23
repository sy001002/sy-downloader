module.exports = {
   "env": {
      "es6": true,
      "node": true
   },
   "extends": "eslint:recommended",
   "parserOptions": {
      "ecmaVersion": 2017,
      "sourceType": "module",
      "ecmaFeatures": {
         "experimentalObjectRestSpread": true
      }
   },
   "rules": {
      "indent": [
         "error",
         3
      ],
      "linebreak-style": [
         "error",
         "unix"
      ],
      "quotes": [
         "error",
         "single"
      ],
      "semi": [
         "error",
         "always"
      ],
      "no-empty": [
         "error", 
         {
            "allowEmptyCatch": true
         }
      ],
      "no-unused-vars": [
         "error", 
         {
            "args": "none"
         }
      ],
      "no-console": [
         "off"
      ],
      "no-constant-condition": [
         "off"
      ],
      "no-irregular-whitespace": [
         "error", {
            "skipRegExps": true
         }
      ]
   }
};
