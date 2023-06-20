module.exports = {
  ignore: ["package-lock.json", "CHANGELOG.md"],
  linters: {
    "*.ts": ["prettier --write", "eslint --fix", "git add"],
    "*.js": ["prettier --write", "eslint --cache --fix", "git add"],
    "*.jsx": ["prettier --write", "eslint --fix", "git add"],
    "*.tsx": ["prettier --write", "eslint --fix", "git add"],
    "*.vue": ["prettier --write", "eslint --cache --fix", "stylelint --fix", "git add"],
    "*.{json,md,yml}": ["prettier --write", "git add"],
    "*.{htm,html,css,sss,less,scss,sass}": ["prettier --write", "stylelint --fix", "git add"],
  },
};
