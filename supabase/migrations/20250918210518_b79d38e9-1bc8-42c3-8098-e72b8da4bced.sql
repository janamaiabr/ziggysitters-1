-- Enable leaked password protection for better security
SELECT auth.set_config_value('security.password_allow_leaked', 'false');