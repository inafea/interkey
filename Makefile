NODE_MODULES = ./node_modules
NODE_BIN = $(NODE_MODULES)/.bin
DATE=$(LOGPATH)$(shell date +'%Y_%m_%d_%H_%M_%S')

.DEFAULT_GOAL := watch


### Moonbase

npm:
	@test -d ./node_modules || npm install --loglevel=error

clean:
	$(NODE_BIN)/moonbase clean
	rm -Rf ./node_modules

build: npm
	$(NODE_BIN)/moonbase build

build_test: npm
	$(NODE_BIN)/moonbase build_test

build_stag: npm
	NODE_ENV='staging' $(NODE_BIN)/moonbase build

build_prod: npm
	NODE_ENV='production' $(NODE_BIN)/moonbase build

watch: npm
	npm run clean
	NODE_ENV='development' $(NODE_BIN)/moonbase watch

staging: npm
	npm run clean
	NODE_ENV='staging' $(NODE_BIN)/moonbase watch

production: npm
	npm run clean
	NODE_ENV='production' $(NODE_BIN)/moonbase watch

### Deployment

deploy: 
	npm run clean
	NODE_ENV='staging' $(NODE_BIN)/moonbase build
	#make git-push-conditional
	git-just-check
	npm run deploy

### Deploys Develop to AWS BUCKET
deploy_prod: 
	npm run clean
	NODE_ENV='production' $(NODE_BIN)/moonbase build
	#make git-push-conditional-timestamp
	make git-just-check
	npm run deploy_prod

### Merge Develop to to Master and Deploys .build to Netlify
deploy_merge_to_master_netlify: 
	npm run clean
	NODE_ENV='production' $(NODE_BIN)/moonbase build
	make git-push-conditional-release-timestamp-merge-to-master
	echo "Release created, develop merged into master, and master pushed to repository, wait for netlify deployment email!"

deploy_double: 
	make git-push-conditional-release-timestamp-merge-to-master-push-to-datum
	make git-push-build-to-bitbucket
	npm run clean
	curl -X POST -d '' https://api.netlify.com/build_hooks/5bf2a901dd28ef09c64d8af1
	echo "Release created, develop merged into master, and master pushed to repository, wait for netlify deployment email!"

### Deploys current branch .build to Netlify, to be run within specific branch
deploy_current_branch_netlify: 
	npm run clean
	NODE_ENV='production' $(NODE_BIN)/moonbase build
	make git-push-conditional-release-timestamp-push-current-branch
	echo "Current Branch pushed to repository, wait for netlify deployment email!"

### Git Tasks

git-push-conditional-release-timestamp-push-current-branch:
	@status=$$(git status --porcelain templates pages assets root); \
	if test "x$${status}" = x; then \
		git commit -am  "Commit Changes to .build folder for $(DATE)" >&2; \
		echo "Good job Bro, source folder seems to be clean." >&2; \
		echo "Version tag $(DATE) is being created." >&2; \
		git fetch --progress --prune --recurse-submodules=no origin >&2; \
		git fetch --tags origin >&2; \
		git tag -a $(DATE) -m "New Deployment with Tag: $(DATE)" >&2; \
		git push --all origin; \
	else \
		echo "\n\n!!! Working directory is dirty, commit/push first !!!\n\n" >&2; exit 1 ; \
	fi

git-push-conditional-release-timestamp-merge-to-master:
	@status=$$(git status --porcelain templates pages assets root); \
	if test "x$${status}" = x; then \
		git commit -am  "Commit Changes to .build folder for $(DATE)" >&2; \
		echo "Good job Bro, source folder seems to be clean." >&2; \
		echo "Version tag $(DATE) is being created." >&2; \
		git fetch --progress --prune --recurse-submodules=no origin >&2; \
		git branch --no-track $(DATE) >&2; \
		git checkout $(DATE) >&2; \
		git fetch --progress --prune --recurse-submodules=no origin >&2; \
		git fetch --progress --prune --recurse-submodules=no origin >&2; \
		git fetch --tags origin >&2; \
		git checkout --ignore-other-worktrees master >&2; \
		git merge --no-ff -m "Finish$(DATE)" $(DATE) >&2; \
		git tag -a $(DATE) -m "New Deployment with Tag: $(DATE)" >&2; \
		git checkout develop >&2; \
		git branch -D $(DATE) >&2; \
		git push --all origin; \
	else \
		echo "\n\n!!! Working directory is dirty, commit/push first !!!\n\n" >&2; exit 1 ; \
	fi

git-push-conditional-release-timestamp-merge-to-master-push-to-datum:
	@status=$$(git status --porcelain templates pages assets root); \
	if test "x$${status}" = x; then \
		git commit -am  "Commit Changes to .build folder for $(DATE)" >&2; \
		echo "Good job Bro, source folder seems to be clean." >&2; \
		echo "Version tag $(DATE) is being created." >&2; \
		git fetch --progress --prune --recurse-submodules=no origin >&2; \
		git branch --no-track $(DATE) >&2; \
		git checkout $(DATE) >&2; \
		git fetch --progress --prune --recurse-submodules=no origin >&2; \
		git fetch --progress --prune --recurse-submodules=no origin >&2; \
		git fetch --tags origin >&2; \
		git checkout --ignore-other-worktrees master >&2; \
		git merge --no-ff -m "Release_$(DATE)" $(DATE) >&2; \
		git tag -a $(DATE) -m "New Deployment with Tag: $(DATE)" >&2; \
		git checkout develop >&2; \
		git branch -D $(DATE) >&2; \
		git push --all git.datumconsultants; \
	else \
		echo "\n\n!!! Working directory is dirty, commit/push first !!!\n\n" >&2; exit 1 ; \
	fi

git-push-build-to-bitbucket:
	@status=$$(git status --porcelain templates pages assets root); \
	if test "x$${status}" = x; then \
		echo "Checking Out to branch: build..." >&2; \
		git checkout build 2>/dev/null || git checkout -B build  >&2; \
		git merge --no-ff -m "Merged into build" develop >&2; \
		NODE_ENV='production' $(NODE_BIN)/moonbase build  >&2; \
		echo "Adding build files to branch..." >&2; \
		git add -f --all .build >&2; \
		git commit -am  "Commit Changes to .build folder" >&2; \
		git checkout develop >&2; \
		git push --all origin; \
	else \
		echo "\n\n!!! Working directory is dirty, commit/push first !!!\n\n" >&2; exit 1 ; \
	fi

git-just-check:
	@status=$$(git status --porcelain templates pages assets root); \
	if test "x$${status}" = x; then \
		echo "Good job Bro, source folder seems to be clean." >&2; \
	else \
		echo "\n\n!!! Working directory is dirty, commit/push first !!!\n\n" >&2; exit 1 ; \
	fi

git-push-conditional-timestamp:
	@status=$$(git status --porcelain templates pages assets root); \
	if test "x$${status}" = x; then \
		echo "Good job Bro, source folder seems to be clean." >&2; \
		echo "Bumping tag and tagging deployed version..." >&2; \
		echo "Version tag number $(DATE) is being created." >&2; \
		git tag -a $(DATE) -m "New Deployment with Tag: $(DATE)" >&2; \
		echo "Pushing current version to repo..." >&2; \
		git push origin --tags >&2; \
		git push --all origin; \
	else \
		echo "\n\n!!! Working directory is dirty, commit/push first !!!\n\n" >&2; exit 1 ; \
	fi

git-push-conditional:
	@status=$$(git status --porcelain templates pages assets root); \
	if test "x$${status}" = x; then \
		echo "Good job Bro, source folder seems to be clean." >&2; \
		git push --all origin; \
	else \
		echo "\n\n!!! Working directory is dirty, commit/push first !!!\n\n" >&2; exit 1 ; \
	fi
