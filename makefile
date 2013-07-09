MOCHA=node_modules/.bin/mocha
REPORTER?=tap
FLAGS=--reporter $(REPORTER)

test:
	$(MOCHA) $(shell find test/* -prune -name "*test.js") $(FLAGS)

bind:
	$(MOCHA) test/bind-test.js $(FLAGS)
.PHONY: test
