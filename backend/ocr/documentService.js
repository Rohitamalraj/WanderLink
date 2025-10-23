/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const { PDFParse } = require('pdf-parse');
