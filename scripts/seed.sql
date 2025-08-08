insert into plans (name, price_cents, billing_interval, features) values
('Free', 0, 'month'::plan_interval, '{"courses":"seleccionados","retos":"limitados"}'),
('Aprendiz', 5000, 'month'::plan_interval, '{"courses":"todos","retos":"todos","certificados":true}'),
('Miau Legendario', 20000, 'month'::plan_interval, '{"todo":"incluido","proyectos_reales":true,"figura_3d":true}');
