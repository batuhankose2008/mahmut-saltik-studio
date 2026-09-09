UPDATE site_profile
SET location = '',
    bio = ''
WHERE id = 1
  AND location = 'İstanbul / TR'
  AND bio IN ('İnsanın yüzünde saklanan sessiz hikâyeleri arayan bir çizim atölyesi.', '');
