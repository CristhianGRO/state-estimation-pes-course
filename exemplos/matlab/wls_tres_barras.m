%% Lista 2 (2024), exercício 1: WLS CC de três barras
% Executar no MATLAB / Octave. Não exige MATPOWER.
clear; clc;

% Ordem dos canais: P12, P21, P13, P23, P1, P2; theta1 = 0 rad.
H = [-25 0; 25 0; 0 -20; 12.5 -12.5; -25 -20; 37.5 -12.5];
sigma = [0.008; 0.008; 0.008; 0.008; 0.010; 0.010]; % p.u.
R = diag(sigma.^2);
z = [6.2452; -6.234; 6.992; 1.13; 13.265; -5.0055];

% Resolver sistema ponderado sem inverter explicitamente G
G = H'*(R\H);
b = H'*(R\z);
theta_hat = G\b;
res = z-H*theta_hat;
J = res'*(R\res);
Omega = R-H*(G\H');
normalized_res = res ./ sqrt(diag(Omega));

fprintf('theta2: %.6f rad\ntheta3: %.6f rad\nJ: %.6f\n', ...
    theta_hat(1), theta_hat(2), J);
theta_ls = H\z;
fprintf('LS: theta2 = %.6f rad; theta3 = %.6f rad\n', theta_ls(1), theta_ls(2));
% Referencias impressas: WLS [-0.2504;-0.3484]; LS [-0.2504;-0.3488].
disp('Colunas: medida, residuo e residuo normalizado');
disp([z, res, normalized_res]);
