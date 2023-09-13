#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { graphQL_Stack } from '../lib/graphQL_Stack';
import { REST_STACK } from '../lib/REST_Stack';

const app = new cdk.App();
new graphQL_Stack(app, 'graphQLStack', {});
new REST_STACK(app, 'RestStack', {});