// For format details, see https://aka.ms/devcontainer.json. For config options, see the README at:
// https://github.com/microsoft/vscode-dev-containers/tree/v0.234.0/containers/ubuntu
{
	"name": "Ubuntu",
	"build": {
		"dockerfile": "Dockerfile",
		// Update 'VARIANT' to pick an Ubuntu version: jammy / ubuntu-22.04, focal / ubuntu-20.04, bionic /ubuntu-18.04
		// Use ubuntu-22.04 or ubuntu-18.04 on local arm64/Apple Silicon.
		"args": { "VARIANT": "ubuntu-22.04" }
	},
	"mounts": [
		"source=/Users/prabhatsharma/.aws,target=/home/vscode/.aws,type=bind,consistency=cached"
	],

	// Set *default* container specific settings.json values on container create.
	"settings": {},


	// Add the IDs of extensions you want installed when the container is created.
	"extensions": [
		"ms-python.vscode-pylance",
		"ms-python.python",
		"github.copilot",
		"eamodio.gitlens"
	],

	// Use 'forwardPorts' to make a list of ports inside the container available locally.
	// "forwardPorts": [],

	// Use 'postCreateCommand' to run commands after the container is created.
	// "postCreateCommand": "uname -a",

	// Comment out to connect as root instead. More info: https://aka.ms/vscode-remote/containers/non-root.
	"remoteUser": "vscode",
	"features": {
		"git": "latest",
		"aws-cli": "latest",
		"node": "lts",
		"python": "3.10"
	}
}
