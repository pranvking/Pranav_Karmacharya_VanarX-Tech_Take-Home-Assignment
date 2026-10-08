# Evidence Documentation

This directory contains real screenshots captured during testing of the Socify development platform (`https://apps.dev.moaaapp.com`).

## Screenshots Index

### 1. Authentication & Tenant Routing
* `01_login_email_step.png`: Step 1 of the authentication flow showing the email input screen.
* `02_login_password_step.png`: Step 2 showing tenant resolution and password authentication screen.
* `app_switcher_menu.png`: Top-level application switcher showing `ecommerce general services`, `Insights`, and channel permission warning.
* `org_branch_switcher.png`: Organization and branch switcher showing multi-tenant hierarchy (`second organization` -> `forth branch`).
* `user_settings_menu.png`: User profile drawer showing authenticated role (`forth user`, `qa-tester`).
* `workspace_management_view.png`: Multi-tenant organization management view under `/platform/organizations`.

### 2. Defect Evidence
* `BUG-001_contacts_view.png`: Navigation overlay / command palette showing routing options for customer/contacts management.
* `BUG-002_ai_chat_pricing_history.png`: Insights AI query history showing pricing prompt evaluation (`"How much is QA Test Shampoo?"` returning Failed status).
* `BUG-002_clickhouse_db_exception.png`: Chat conversation showing AI assistant evaluation, cross-tenant isolation enforcement, and the stock inquiry prompt crash.
* `BUG-002_insights_ai_view.png`: Overview of the AI Insights dashboard and recent query sessions.
* `BUG-003_dashboard_action_buttons_dead_clicks.png`: Main dashboard overview showing the action buttons (`See follow-ups`, `Active threads in inbox`, `Contacts with no assignee`, `Integrate channels`, `Open inbox`) that suffer from dead clicks (BUG-004).
* `BUG_content_route_redirect.png`: Demonstration of the Content sidebar route failing to render and bouncing back to `/dashboard` (BUG-008).
* `BUG-005_products_catalog.png`: Products catalog management interface (`/commerce/stores/126/products`).
* `BUG-005_add_product_modal.png`: Step 1 of the Add Product form where price and weight validation rules are parsed (BUG-006).
* `BUG_connections_channels_list.png`: Integrations interface showing status of Shopify (Active), Daraz (Not Connected), and Pathao (Active) (BUG-009, BUG-010).
