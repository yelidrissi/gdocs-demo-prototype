#===============================================================================
# DEFAULT MAKE VARIABLES
#===============================================================================

# defaults to "Test doc for gd-pandoc"
doc = https://docs.google.com/a/evolvingweb.ca/document/d/1dwYaiiy4P0KA7PvNwAP2fsPAf6qMMNzwaq8W66mwyds/edit#heading=h.4lk08p1hx3w
doc_id = $(shell echo $(doc) | sed -e 's@^https.*document/d/@@' -e 's@/edit.*@@')
name = default
#Custom Addition
server = $(shell pwd)
outdir = $(server)/build
input = $(server)/uploads
converted = $(server)/downloads
gdocs_export = $(server)/gdocs-export
#Addition over
input_file = $(input)/$(name).html
OUTPUT = $(outdir)/$(name)
auth_file = google-api-authorization.yaml
docker_workdir = /var/gdocs-export/
docker_run_cmd = docker run -i -v `pwd`:$(docker_workdir) -p 12736:12736 dergachev/gdocs-export

# directory containing customized header.tex, etc...
theme = ew

all: convert


#===============================================================================
# PANDOC TARGETS
#===============================================================================

latex:
	mkdir -p $(OUTPUT)
	cp $(gdocs_export)/assets/default/* $(OUTPUT)
	test -z "$(theme)" || cp $(gdocs_export)/assets/$(theme)/* $(OUTPUT)
	cp $(input_file) $(OUTPUT)/in.html

	bundle exec ruby -C $(OUTPUT) "$(gdocs_export)/lib/pandoc-preprocess.rb" in.html > $(OUTPUT)/preprocessed.html
	pandoc --parse-raw $(OUTPUT)/preprocessed.html -t json > $(OUTPUT)/pre.json
	cat $(OUTPUT)/pre.json | $(gdocs_export)/lib/pandoc-filter.py > $(OUTPUT)/post.json

	# use pandoc to create metadata.tex, main.tex (these are included by ew-template.tex)
	pandoc $(OUTPUT)/post.json --no-wrap -t latex --template "$(OUTPUT)/template-metadata.tex" > "$(OUTPUT)/metadata.tex"
	pandoc $(OUTPUT)/post.json --chapters --no-wrap -t latex > $(OUTPUT)/main.tex

	# must use -o with docx output format, since its binary
	pandoc $(OUTPUT)/post.json -s -t docx -o $(OUTPUT)/$(name).docx
	pandoc $(OUTPUT)/post.json -s -t rtf -o $(OUTPUT)/$(name).rtf

pdf:
	# convert latex to PDF
	echo "Created $(OUTPUT)/$(name).tex, compiling into $(name).pdf"
	# rubber will set output PDF filename based on latex input filename
	cp -f $(OUTPUT)/template.tex $(OUTPUT)/$(name).tex
	( cd $(OUTPUT); rubber -d $(name).tex)
	# ( cd $(OUTPUT); latexmk -pdf $(name))

convert: latex pdf

diff:
	/usr/bin/perl "`which latexdiff`" --flatten $(outdir)/$(before)/$(before).tex $(OUTPUT)/$(name).tex > $(OUTPUT)/diff.tex
	(cd $(OUTPUT); latexmk -pdf diff)


#===============================================================================
# DOCKER TARGETS
#===============================================================================

build_docker:
	@echo "Warning: building can take a while (~15m)."
	dpkg -l squid-deb-proxy || sudo apt-get install -y squid-deb-proxy
	docker build -t dergachev/gdocs-export .

docker_debug:
	$(docker_run_cmd) /bin/bash

latest:
	docker run -t -i `docker images -q | head -n 1` /bin/bash

docker_convert:
	$(docker_run_cmd) make convert OUTPUT=$(OUTPUT) name=$(name) input_file=$(input_file) theme=$(theme)

docker_diff:
	docker run -t -i -v `pwd`:$(docker_workdir) -p 12736:12736 dergachev/gdocs-export make diff OUTPUT=$(OUTPUT) name=$(name) input_file=$(input_file) before=$(before)

#===============================================================================
# MISC TARGETS
#===============================================================================

test:
	bundle exec rspec

#===============================================================================
# CUSTOM TARGETS
#===============================================================================
move_and_organize:
	mkdir -p $(converted)/$(name)
	cp $(addprefix $(OUTPUT)/$(name).,docx rtf pdf) $(converted)/$(name)/
	cd $(converted)/$(name) && zip -r $(name).zip .

full_docker_convert: docker_convert move_and_organize

clean_build:
	@echo "Now deleting $(OUTPUT) and all files in it."
	rm -rf $(OUTPUT)
