import './styles/reset.css';

import { mkdir } from 'node:fs';
import http from 'node:http';

import { named } from 'external-module';
import NextAuth from 'next-auth';
import React, { useState, useEffect } from 'react';

import './styles/base.css';

import { offset } from './database/utils';
import MyButtonComponent from './components/button';

import './styles/theme.css';

import * as fs from 'fs';
import * as schema from './database/schema';

import type { Metadata } from 'next';
import type { ComponentProps } from 'react';
import type { ExternalType } from 'external-module';

import type { User } from './api/structure/user';

import './styles/globals.css';
