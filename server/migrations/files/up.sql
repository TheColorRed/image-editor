CREATE TABLE IF NOT EXISTS files (
  path text,
  exif text,
  iptc text,
  tags text,
  rating text,
  stat text,
  ai text,
  primary key (path)
);