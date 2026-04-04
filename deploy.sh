#!/bin/bash

# Requires HF_TOKEN to be set in environment before running
# export HF_TOKEN="your_hf_token_here"

hf upload GraziePrego/deepresearch . . --repo-type=space
