# Develop the project

Start with the module that owns the behavior you want to change. The frontend uses Feature-Sliced Design; the CLI owns scaffold templates; shared tools provide configuration and documentation services; the MCP package exposes those services through its protocol.

## Locate the source and test boundary

- **Architecture** maps packages, responsibilities and data flow.
- **Contributing and testing** identifies authoritative templates, generated outputs and the validation commands.
- **Functionalities** provides a broad reference for existing capabilities and configuration.

## Make a reviewable change

Describe the observable behavior, reproduce it through a public interface and update the source before regenerating artifacts. Keep tests about rendered controls, returned configuration or written files instead of private helpers. Review translations and accessibility when changing a user-facing control. Run the checks appropriate to the affected packages, then inspect the generated diff before committing. Existing version directories should remain intact unless the change explicitly requires updating their content.

> Version: 0.0.16
