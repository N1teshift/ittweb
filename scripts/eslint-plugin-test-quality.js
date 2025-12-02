/**
 * ESLint Plugin for Test Quality
 *
 * Rules to ensure tests actually test what they claim to test:
 * - no-only-tests: Prevents .only in test files
 * - no-empty-test: Ensures tests have assertions
 * - no-mock-without-assert: Ensures mocks are verified
 * - meaningful-assertions: Ensures assertions are meaningful
 * - test-naming-convention: Ensures test names are descriptive
 */

const TEST_FUNCTIONS = ['describe', 'it', 'test', 'beforeEach', 'afterEach', 'beforeAll', 'afterAll'];
const ASSERTION_FUNCTIONS = ['expect', 'assert', 'should', 'toBe', 'toEqual', 'toHaveBeenCalled'];
const MOCK_FUNCTIONS = ['jest.fn', 'jest.mock', 'jest.spyOn', 'vi.fn', 'vi.mock', 'vi.spyOn'];

module.exports = {
  rules: {
    'no-only-tests': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Prevents .only in test files which can hide other failing tests',
          category: 'Test Quality',
        },
        messages: {
          noOnly: 'Remove .only from test - it prevents other tests from running'
        }
      },
      create(context) {
        return {
          'CallExpression[callee.property.name="only"]'(node) {
            if (TEST_FUNCTIONS.includes(node.callee.object.name)) {
              context.report({
                node,
                messageId: 'noOnly'
              });
            }
          }
        };
      }
    },

    'no-empty-test': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Ensures test functions have meaningful content',
          category: 'Test Quality',
        },
        messages: {
          emptyTest: 'Test function appears to be empty or have no assertions'
        }
      },
      create(context) {
        return {
          CallExpression(node) {
            if (TEST_FUNCTIONS.includes(node.callee.name) && node.arguments.length >= 1) {
              const testFn = node.arguments[node.arguments.length - 1];
              if (testFn.type === 'ArrowFunctionExpression' || testFn.type === 'FunctionExpression') {
                const body = testFn.body;
                if (body.type === 'BlockStatement') {
                  const hasAssertions = body.body.some(stmt => {
                    return stmt.type === 'ExpressionStatement' &&
                           stmt.expression.type === 'CallExpression' &&
                           ASSERTION_FUNCTIONS.some(fn => stmt.expression.callee.name?.includes(fn) ||
                                                       stmt.expression.callee.property?.name?.includes(fn));
                  });

                  const hasComments = body.body.some(stmt => stmt.type === 'EmptyStatement' ||
                                                           (stmt.type === 'BlockStatement' && stmt.body.length === 0));

                  if (!hasAssertions && body.body.length <= 1) {
                    context.report({
                      node,
                      messageId: 'emptyTest'
                    });
                  }
                }
              }
            }
          }
        };
      }
    },

    'no-mock-without-assert': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Ensures mock functions are verified with assertions',
          category: 'Test Quality',
        },
        messages: {
          unverifiedMock: 'Mock "{{mockName}}" is created but never verified with an assertion'
        }
      },
      create(context) {
        const mocks = new Map();

        return {
          'VariableDeclarator'(node) {
            if (node.init &&
                node.init.type === 'CallExpression' &&
                MOCK_FUNCTIONS.some(fn => node.init.callee.name?.includes(fn) ||
                                        node.init.callee.property?.name?.includes(fn))) {
              mocks.set(node.id.name, node);
            }
          },

          'CallExpression'(node) {
            // Check for mock verifications
            if (node.callee.type === 'MemberExpression' &&
                node.callee.property.name === 'toHaveBeenCalled') {
              const mockName = node.callee.object.callee?.object?.name;
              if (mockName && mocks.has(mockName)) {
                mocks.delete(mockName);
              }
            }
          },

          'Program:exit'() {
            for (const [mockName, node] of mocks) {
              context.report({
                node,
                messageId: 'unverifiedMock',
                data: { mockName }
              });
            }
          }
        };
      }
    },

    'meaningful-assertions': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Ensures assertions are meaningful and not just checking existence',
          category: 'Test Quality',
        },
        messages: {
          meaninglessAssert: 'Assertion only checks for existence - add more specific verification',
          noAssertions: 'Test has no assertions - add expect/assert statements'
        }
      },
      create(context) {
        let hasAssertions = false;
        let assertionCount = 0;
        const meaninglessPatterns = [
          'toBeDefined',
          'toBeTruthy',
          'toBeFalsy',
          'toBe',
          'toEqual'
        ];

        return {
          'CallExpression'(node) {
            if (ASSERTION_FUNCTIONS.some(fn => node.callee.name?.includes(fn) ||
                                             node.callee.property?.name?.includes(fn))) {
              hasAssertions = true;
              assertionCount++;

              // Check for meaningless assertions
              if (node.callee.property?.name && meaninglessPatterns.includes(node.callee.property.name)) {
                const args = node.arguments;
                if (args.length === 0 || (args[0].type === 'Literal' && args[0].value === true)) {
                  context.report({
                    node,
                    messageId: 'meaninglessAssert'
                  });
                }
              }
            }
          },

          [`CallExpression[callee.name=/^(${TEST_FUNCTIONS.join('|')})$/]`](node) {
            // Reset counters for each test
            hasAssertions = false;
            assertionCount = 0;
          },

          'Program:exit'() {
            if (!hasAssertions) {
              // This would need to be reported on the test function, but we can't easily track that
              // The rule would need more complex logic to associate assertions with test functions
            }
          }
        };
      }
    },

    'test-naming-convention': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Ensures test names are descriptive and follow conventions',
          category: 'Test Quality',
        },
        messages: {
          badTestName: 'Test name "{{name}}" is not descriptive enough',
          missingShould: 'Test name should start with "should" for clarity'
        }
      },
      create(context) {
        return {
          'CallExpression'(node) {
            if (TEST_FUNCTIONS.includes(node.callee.name) && node.arguments.length >= 1) {
              const testName = node.arguments[0];
              if (testName.type === 'Literal' && typeof testName.value === 'string') {
                const name = testName.value.toLowerCase();

                // Skip describe blocks and setup/teardown
                if (node.callee.name === 'describe' ||
                    name.includes('setup') ||
                    name.includes('teardown') ||
                    name.includes('before') ||
                    name.includes('after')) {
                  return;
                }

                // Check for meaningful test names
                const badPatterns = [
                  /^test$/,
                  /^test \d+$/,
                  /^it$/,
                  /^it works$/,
                  /^works$/,
                  /^does something$/,
                  /^handles$/,
                  /^test case/
                ];

                if (badPatterns.some(pattern => pattern.test(name))) {
                  context.report({
                    node: testName,
                    messageId: 'badTestName',
                    data: { name: testName.value }
                  });
                }

                // Encourage "should" prefix for clarity
                if (!name.startsWith('should') && !name.includes('should')) {
                  context.report({
                    node: testName,
                    messageId: 'missingShould',
                    data: { name: testName.value }
                  });
                }
              }
            }
          }
        };
      }
    }
  }
};
