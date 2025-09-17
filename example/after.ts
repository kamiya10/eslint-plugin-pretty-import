import { access, readFile, writeFile } from 'node:fs/promises';
import { ReadStream, WriteStream } from 'node:fs';
import { TextDecoder, TextEncoder } from 'node:util';
import { createServer } from 'node:http';

import assert from 'node:assert';
import crypto from 'node:crypto';
import path from 'node:path';

import { BehaviorSubject, Observable } from 'rxjs';
import { NextRequest, NextResponse } from 'next/server';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { produce } from 'immer';
import { z } from 'zod';

import dayjs from 'dayjs';

import 'dotenv/config';

import { useEffect, useMemo, useState } from 'react';

import axios from 'axios';

import { ErrorBoundary, ErrorFallback } from '@/components/error';
import { LocalStorage, SessionStorage } from '@/utils/storage';
import { formatDate } from '@/utils/date';

import AuthProvider from '@/providers/auth';

import { ApiClient, apiUtils } from './lib/api';
import { generateId } from './lib/id';
import { parseConfig } from './config/parser';
import { validateUser } from './utils/validation';

import AppLayout from './layouts/app';
import Button from './components/button';

import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ComponentType, ReactElement, ReactNode } from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import type { ParsedUrlQuery } from 'querystring';

import type { RequestPayload, ResponseData } from '@/lib/api';
import type { User, UserProfile } from '@/lib/api/users';

import './styles/components.css';
import './styles/fonts.css';
import './styles/global.css';
