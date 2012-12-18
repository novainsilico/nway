PROJECT_NAME      = nway
NOVADOX           = novadox
DOCOUTPUT         = ./doc/index.html
DOCINPUT          = Readme.md lib/*.js lib/builders/*.js demo/01_simple/*.js demo/02_arequire/*.js demo/03_substitute/*.js demo/04_jade/*.js demo/05_coffee/*.js
MOCHA_OPTS        =
REPORTER          = spec
TEST_UNIT         = ./test/unit
TEST_FUNCTIONAL   = ./test/functional


# TEST
.PHONY: test test-unit test-cov testlive

test: test-unit


test-unit:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS) \
		$(TEST_UNIT)

test-functional:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS) \
		$(TEST_FUNCTIONAL)

test-cov: lib-cov
	@TEST_COV=1 $(MAKE) test-unit REPORTER=html-cov \
		| sed 's/<h1 id="overview">Coverage<\/h1>/<h1 id="overview">$(PROJECT_NAME) test coverage<\/h1>/' \
		> $(COVERAGE)

lib-cov: clean-cov
	@jscoverage lib lib-cov \
		--no-instrument=builtins \
		--no-instrument=templates

clean-cov:
	@rm -rf lib-cov


# DOCUMENTATION
.PHONY: doc docclean docdir

doc: docclean docdir
	$(NOVADOX) -g generatorOS $(DOCINPUT) -o $(DOCOUTPUT)

docdir:
	@mkdir -p doc

docclean:
	@rm -rf $(DOCOUTPUT)
