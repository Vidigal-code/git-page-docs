# Operations and development

Maintaining a documentation site involves both its published content and the runtime that displays it. Choose the branch below that matches the change; a content update does not always require changing the frontend, and a viewer fix should not rewrite historical documents unnecessarily.

## Two paths through the project

- **Ship and maintain** groups deployment, migration, troubleshooting and frequently asked questions. Use it to prepare an upgrade or investigate a published-site failure.
- **Develop the project** groups architecture, contributing/testing and feature references. Use it to locate the correct source module and its validation boundary.

## Keep releases traceable

Record the intended version, review generated changes and preserve documents used by existing links. Validate local behavior and the deployed base path separately. When an external player, browser voice or hosting policy changes, distinguish that dependency from repository behavior before modifying the implementation. The child guides provide the concrete commands and checks for each task.

> Version: 0.0.9
