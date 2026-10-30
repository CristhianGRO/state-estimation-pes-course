%% Exemplo didático de WLS CC (modelo linear de três barras)
% Executar no MATLAB / Octave. Não exige MATPOWER.
clear; clc;

H = [-5 0; 0 -4; 2.5 -2.5];
theta_true = [-0.060; -0.095];     % rad
sigma = [0.020; 0.025; 0.020];    % pu
R = diag(sigma.^2);
z = H*theta_true + [0.012; -0.010; 0.008];

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
disp(table(z, res, normalized_res, ...
    'VariableNames', {'Medicao','Residuo','ResiduoNormalizado'}));
