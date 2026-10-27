/* Koki & Khabib Animal Aid: in-browser file preparation (compress photos, fingerprint files, read camera date). */
(function () {
  'use strict';
  var KK = (window.KK = window.KK || {});
  var MAX_DIM = 1600, QUALITY = 0.82;

  function hex(buf) {
    return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }

  /** SHA-256 of the original file (exact-duplicate detection). Empty string where unsupported. */
  KK.sha256 = function (blob) {
    if (!window.crypto || !crypto.subtle || !blob.arrayBuffer) return Promise.resolve('');
    return blob.arrayBuffer().then(function (b) { return crypto.subtle.digest('SHA-256', b); }).then(hex).catch(function () { return ''; });
  };

  /** Reads EXIF DateTimeOriginal (or DateTime) from a JPEG. Returns ISO string or ''. */
  KK.exifDate = function (blob) {
    if (!/jpe?g/i.test(blob.type || '') || !blob.slice) return Promise.resolve('');
    return blob.slice(0, 256 * 1024).arrayBuffer().then(function (buf) {
      var v = new DataView(buf);
      if (v.byteLength < 4 || v.getUint16(0) !== 0xffd8) return '';
      var off = 2;
      while (off + 4 < v.byteLength) {
        var marker = v.getUint16(off), size = v.getUint16(off + 2);
        if (marker === 0xffe1 && v.getUint32(off + 4) === 0x45786966) return parseTiff(v, off + 10);
        if ((marker & 0xff00) !== 0xff00 || size < 2) break;
        off += 2 + size;
      }
      return '';
    }).catch(function () { return ''; });
  };
  function parseTiff(v, t) {
    var le = v.getUint16(t) === 0x4949;
    var u16 = function (o) { return v.getUint16(o, le); }, u32 = function (o) { return v.getUint32(o, le); };
    var readAscii = function (o, n) { var s = ''; for (var i = 0; i < n - 1 && o + i < v.byteLength; i++) s += String.fromCharCode(v.getUint8(o + i)); return s; };
    var scan = function (ifd, want) {
      if (ifd + 2 > v.byteLength) return {};
      var n = u16(ifd), out = {};
      for (var i = 0; i < n; i++) {
        var e = ifd + 2 + i * 12;
        if (e + 12 > v.byteLength) break;
        var tag = u16(e);
        if (want.indexOf(tag) >= 0) {
          var type = u16(e + 2), count = u32(e + 4);
          out[tag] = type === 2 ? readAscii(t + u32(e + 8), count) : u32(e + 8);
        }
      }
      return out;
    };
    try {
      var ifd0 = scan(t + u32(t + 4), [0x0132, 0x8769]);
      var exif = ifd0[0x8769] ? scan(t + ifd0[0x8769], [0x9003]) : {};
      var s = exif[0x9003] || ifd0[0x0132] || '';
      var m = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/.exec(s);
      if (!m || m[1] === '0000') return '';
      return m[1] + '-' + m[2] + '-' + m[3] + 'T' + m[4] + ':' + m[5] + ':' + m[6] + '+05:30';
    } catch (e) { return ''; }
  }

  function loadImage(blob) {
    if (window.createImageBitmap) {
      return createImageBitmap(blob, { imageOrientation: 'from-image' }).catch(function () { return createImageBitmap(blob); }).catch(function () { return viaImg(blob); });
    }
    return viaImg(blob);
  }
  function viaImg(blob) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(blob), img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('decode')); };
      img.src = url;
    });
  }

  /** 64-bit difference hash (9×8 greyscale) as 16 hex chars; it survives resizing and recompression. */
  function dhash(img) {
    var c = document.createElement('canvas'); c.width = 9; c.height = 8;
    var x = c.getContext('2d', { willReadFrequently: true });
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    x.drawImage(img, 0, 0, 9, 8);
    var d = x.getImageData(0, 0, 9, 8).data, bits = '', out = '';
    for (var y = 0; y < 8; y++) {
      for (var i = 0; i < 8; i++) {
        var p = (y * 9 + i) * 4, q = p + 4;
        var a = d[p] * 0.299 + d[p + 1] * 0.587 + d[p + 2] * 0.114;
        var b = d[q] * 0.299 + d[q + 1] * 0.587 + d[q + 2] * 0.114;
        bits += a > b ? '1' : '0';
      }
    }
    for (var k = 0; k < 64; k += 4) out += parseInt(bits.substr(k, 4), 2).toString(16);
    return out;
  }

  function compress(img) {
    var w = img.width, h = img.height, scale = Math.min(1, MAX_DIM / Math.max(w, h));
    var c = document.createElement('canvas'); c.width = Math.round(w * scale); c.height = Math.round(h * scale);
    var x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
    x.drawImage(img, 0, 0, c.width, c.height);
    return new Promise(function (resolve) { c.toBlob(function (b) { resolve(b); }, 'image/jpeg', QUALITY); });
  }

  /**
   * Prepares one picked file. Returns { blob, name, mime, size, sha256, dhash, exifDate, preview, isImage }.
   * Photos are compressed to ~1600px JPEG; PDFs and videos are sent as they are (size limits apply).
   */
  KK.prepareFile = function (file) {
    var isImage = /^image\//.test(file.type) || /\.(heic|heif|jpe?g|png|webp)$/i.test(file.name);
    var base = { name: file.name || 'file', isImage: isImage };
    return Promise.all([KK.sha256(file), isImage ? KK.exifDate(file) : Promise.resolve('')]).then(function (r) {
      base.sha256 = r[0]; base.exifDate = r[1];
      if (!isImage) {
        base.blob = file; base.mime = file.type || 'application/octet-stream'; base.size = file.size;
        return base;
      }
      return loadImage(file).then(function (img) {
        base.dhash = dhash(img);
        return compress(img).then(function (b) {
          if (img.close) img.close();
          var useOriginal = !b || (b.size > file.size && /jpe?g/i.test(file.type));
          base.blob = useOriginal ? file : b;
          base.mime = useOriginal ? (file.type || 'image/jpeg') : 'image/jpeg';
          base.size = base.blob.size;
          base.name = base.name.replace(/\.(heic|heif|png|webp)$/i, '.jpg');
          base.preview = URL.createObjectURL(base.blob);
          return base;
        });
      }).catch(function () {
        // Could not decode (e.g. HEIC on a desktop browser): send the original if it is a known image type.
        base.blob = file; base.mime = file.type || 'image/heic'; base.size = file.size; base.dhash = '';
        return base;
      });
    });
  };

  KK.toBase64 = function (blob) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(String(r.result).split(',')[1] || ''); };
      r.onerror = function () { reject(r.error); };
      r.readAsDataURL(blob);
    });
  };

  /* ---------- IndexedDB store so prepared files survive the browser being closed (e.g. while the camera is open) ---------- */
  var DB = 'kk-files', STORE = 'files';
  function db() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) return reject(new Error('no idb'));
      var r = indexedDB.open(DB, 1);
      r.onupgradeneeded = function () { r.result.createObjectStore(STORE); };
      r.onsuccess = function () { resolve(r.result); };
      r.onerror = function () { reject(r.error); };
    });
  }
  function tx(mode, fn) {
    return db().then(function (d) {
      return new Promise(function (resolve, reject) {
        var t = d.transaction(STORE, mode), s = t.objectStore(STORE), out = fn(s);
        t.oncomplete = function () { resolve(out && out.result !== undefined ? out.result : undefined); };
        t.onerror = function () { reject(t.error); };
      });
    });
  }
  KK.fileStore = {
    put: function (key, rec) { return tx('readwrite', function (s) { return s.put(rec, key); }).catch(function () {}); },
    del: function (key) { return tx('readwrite', function (s) { return s.delete(key); }).catch(function () {}); },
    all: function (prefix) {
      return db().then(function (d) {
        return new Promise(function (resolve) {
          var out = [], t = d.transaction(STORE, 'readonly'), s = t.objectStore(STORE), c = s.openCursor();
          c.onsuccess = function () { var cur = c.result; if (!cur) return resolve(out); if (String(cur.key).indexOf(prefix) === 0) out.push({ key: cur.key, rec: cur.value }); cur.continue(); };
          c.onerror = function () { resolve(out); };
        });
      }).catch(function () { return []; });
    },
    clear: function (prefix) { return KK.fileStore.all(prefix).then(function (list) { return Promise.all(list.map(function (x) { return KK.fileStore.del(x.key); })); }); },
  };
})();
