DELETE FROM artworks
WHERE title IN ('Sessiz Bakış', 'İçsel Yolculuk', 'Kentin Hafızası')
  AND code IN ('MS-240101', 'MS-240102', 'MS-240103');

UPDATE site_profile
SET bio = '', location = ''
WHERE id = 1
  AND bio = 'İnsanın yüzünde saklanan sessiz hikâyeleri arayan bir çizim atölyesi.';
