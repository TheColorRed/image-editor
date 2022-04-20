CREATE TABLE IF NOT EXISTS collections (
  label text,
  type text,
  info text,
  primary key (label, type)
);