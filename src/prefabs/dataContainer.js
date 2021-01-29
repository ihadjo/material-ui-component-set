(() => ({
  name: 'DataContainer',
  icon: 'DataContainer',
  category: 'DATA',
  beforeCreate: ({
    prefab,
    save,
    close,
    components: { ModelSelector, Header, Content, Field, Footer, Text },
    helpers: { useCurrentPageId, camelToSnakeCase },
  }) => {
    const [modelId, setModelId] = React.useState('');
    const [model, setModel] = React.useState(null);
    const [validation, setValidation] = React.useState('');
    const pageUuid = useCurrentPageId();

    React.useEffect(() => {
      setValidation('');
    }, [modelId]);

    return (
      <>
        <Header onClose={close} title="Configure dataContainer" />
        <Content>
          <p>
            Another page is linked to this page, and passes the data to this
            DataContainer.
          </p>
          <Field
            label="Select model"
            error={validation && <Text color="#e82600">{validation}</Text>}
          >
            <ModelSelector
              onChange={(id, modelObject) => {
                setModel(modelObject);
                setModelId(id);
              }}
              value={modelId}
              margin
            />
          </Field>
        </Content>
        <Footer
          onClose={close}
          onSave={() => {
            if (!modelId || !model) {
              setValidation('Model is required');
              return;
            }
            const idProperty = model.properties.find(
              property => property.name === 'id',
            );
            const variableName = `${camelToSnakeCase(model.label)}_id`;

            if (!idProperty) {
              setValidation('This model has no ID property');
              return;
            }

            const newPrefab = { ...prefab };
            newPrefab.structure[0].options[0].value = modelId;
            newPrefab.variables[0].pageId = pageUuid;
            newPrefab.variables[0].name = variableName;
            newPrefab.structure[0].options[2].value = {
              [idProperty.id]: {
                eq: {
                  ref: { id: '#idVariable' },
                  name: variableName,
                  type: 'VARIABLE',
                },
              },
            };
            save(newPrefab);
          }}
        />
      </>
    );
  },
  variables: [
    {
      kind: 'integer',
      name: '',
      pageId: '',
      ref: {
        id: '#idVariable',
      },
    },
  ],
  structure: [
    {
      name: 'DataContainer',
      options: [
        {
          value: '',
          label: 'Model',
          key: 'model',
          type: 'MODEL',
        },
        {
          value: '',
          label: 'Current Record',
          key: 'currentRecord',
          type: 'NUMBER',
          configuration: {
            condition: {
              type: 'SHOW',
              option: 'currentRecord',
              comparator: 'EQ',
              value: 'never',
            },
          },
        },
        {
          value: {},
          label: 'Filter',
          key: 'filter',
          type: 'FILTER',
          configuration: {
            dependsOn: 'model',
          },
        },
        {
          value: '',
          label: 'Authentication Profile',
          key: 'authProfile',
          type: 'AUTHENTICATION_PROFILE',
        },
        {
          value: '',
          label: 'Redirect when no result',
          key: 'redirectWithoutResult',
          type: 'ENDPOINT',
        },
        {
          value: 'built-in',
          label: 'Error message',
          key: 'showError',
          type: 'CUSTOM',
          configuration: {
            as: 'BUTTONGROUP',
            dataType: 'string',
            allowedInput: [
              { name: 'Built in', value: 'built-in' },
              { name: 'Interaction', value: 'interaction' },
            ],
          },
        },
      ],
      descendants: [],
    },
  ],
}))();
